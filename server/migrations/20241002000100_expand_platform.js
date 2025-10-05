export async function up(knex) {
  await knex.schema.alterTable('customers', (table) => {
    table.string('supabase_user_id').unique();
    table.boolean('wants_marketing').defaultTo(false);
    table.boolean('loyalty_opt_in').defaultTo(false);
  });

  await knex.schema.alterTable('products', (table) => {
    table.boolean('is_active').defaultTo(true);
    table.integer('inventory_threshold').defaultTo(10);
  });

  await knex.schema.alterTable('orders', (table) => {
    table.string('status').defaultTo('pending');
    table.string('discount_code');
    table.string('fulfillment_status').defaultTo('processing');
    table.timestamp('placed_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.text('description');
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('product_categories', (table) => {
    table
      .uuid('product_id')
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table
      .uuid('category_id')
      .references('id')
      .inTable('categories')
      .onDelete('CASCADE');
    table.primary(['product_id', 'category_id']);
  });

  await knex.schema.createTable('product_reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('product_id')
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table
      .uuid('customer_id')
      .references('id')
      .inTable('customers')
      .onDelete('SET NULL');
    table.integer('rating').notNullable();
    table.string('title');
    table.text('body');
    table.boolean('is_published').defaultTo(true);
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('wishlists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('customer_id')
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE')
      .unique();
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('wishlist_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('wishlist_id')
      .references('id')
      .inTable('wishlists')
      .onDelete('CASCADE');
    table
      .uuid('product_id')
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.unique(['wishlist_id', 'product_id']);
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('employees', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('supabase_user_id').notNullable().unique();
    table.string('name').notNullable();
    table.string('role').notNullable().defaultTo('employee');
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('employee_inquiries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('customer_email').notNullable();
    table.string('subject').notNullable();
    table.text('message').notNullable();
    table.string('status').defaultTo('open');
    table
      .uuid('assigned_to')
      .references('id')
      .inTable('employees')
      .onDelete('SET NULL');
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('discounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code').notNullable().unique();
    table.decimal('percentage', 5, 2).notNullable();
    table.timestamp('starts_at');
    table.timestamp('expires_at');
    table.integer('usage_limit');
    table.integer('times_used').defaultTo(0);
    table.boolean('stackable').defaultTo(false);
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('order_status_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('order_id')
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('status').notNullable();
    table.text('note');
    table.uuid('changed_by');
    table.timestamps(true, true, true);
  });

  await knex.schema.createTable('shipments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('order_id')
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('carrier');
    table.string('tracking_number');
    table.timestamp('estimated_delivery');
    table.string('status').defaultTo('preparing');
    table.timestamps(true, true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('shipments');
  await knex.schema.dropTableIfExists('order_status_history');
  await knex.schema.dropTableIfExists('discounts');
  await knex.schema.dropTableIfExists('employee_inquiries');
  await knex.schema.dropTableIfExists('employees');
  await knex.schema.dropTableIfExists('wishlist_items');
  await knex.schema.dropTableIfExists('wishlists');
  await knex.schema.dropTableIfExists('product_reviews');
  await knex.schema.dropTableIfExists('product_categories');
  await knex.schema.dropTableIfExists('categories');

  await knex.schema.alterTable('orders', (table) => {
    table.dropColumns('status', 'discount_code', 'fulfillment_status', 'placed_at');
  });

  await knex.schema.alterTable('products', (table) => {
    table.dropColumns('is_active', 'inventory_threshold');
  });

  await knex.schema.alterTable('customers', (table) => {
    table.dropColumns('supabase_user_id', 'wants_marketing', 'loyalty_opt_in');
  });
}
