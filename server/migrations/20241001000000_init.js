export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('customers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.boolean('has_account').defaultTo(false);
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.string('category').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('compare_at_price', 10, 2);
    table.string('image_url').notNullable();
    table.integer('inventory').defaultTo(0);
    table.decimal('rating', 3, 2).defaultTo(4.8);
    table.integer('reviews').defaultTo(0);
    table.specificType('badges', 'text[]').defaultTo(knex.raw('ARRAY[]::text[]'));
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('customer_id')
      .references('id')
      .inTable('customers')
      .onDelete('SET NULL');
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('discount', 10, 2).notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.string('payment_brand');
    table.string('payment_last4');
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('shipping_addresses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('order_id')
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('address_line');
    table.string('city');
    table.string('postal_code');
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('order_id')
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.uuid('product_id');
    table.string('name');
    table.integer('quantity');
    table.decimal('unit_price', 10, 2);
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('inventory_ledger', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('product_id')
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.integer('delta').notNullable();
    table.string('reason');
    table.timestamps(true, true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('inventory_ledger');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('shipping_addresses');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('customers');
}
