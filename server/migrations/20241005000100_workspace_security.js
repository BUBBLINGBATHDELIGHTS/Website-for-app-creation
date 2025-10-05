export async function up(knex) {
  await knex.schema.createTable('workspace_registrations', (table) => {
    table.uuid('id').primary();
    table.string('email').notNullable().unique();
    table
      .enu('role', ['admin', 'employee'], {
        useNative: true,
        enumName: 'workspace_role',
      })
      .notNullable();
    table
      .enu('status', ['pending', 'approved', 'revoked'], {
        useNative: true,
        enumName: 'workspace_registration_status',
      })
      .notNullable()
      .defaultTo('pending');
    table.string('requested_by');
    table.jsonb('notes').defaultTo(knex.raw("'[]'::jsonb"));
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('workspace_registrations');
  await knex.raw('DROP TYPE IF EXISTS workspace_role');
  await knex.raw('DROP TYPE IF EXISTS workspace_registration_status');
}
