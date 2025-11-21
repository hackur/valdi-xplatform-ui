---
description: Create a Laravel migration following project conventions
---

Create a Laravel database migration following project conventions:

## Migration Creation Process

### 1. Planning

Determine:
- **Type**: Create table, modify table, add column, add index?
- **Table Name**: Singular or plural? Follow Laravel conventions
- **Changes**: What exactly needs to change?
- **Dependencies**: Any foreign keys or relationships?
- **Rollback**: How to undo this change?

### 2. Generate Migration

```bash
# Create table
php artisan make:migration create_tablename_table

# Add column
php artisan make:migration add_column_to_tablename_table

# Modify column
php artisan make:migration modify_column_in_tablename_table
```

### 3. PCR Card Migration Patterns

**Table Creation**:
```php
Schema::create('table_name', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->text('description')->nullable();
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamps();
    $table->softDeletes();

    // Indexes
    $table->index('status');
    $table->unique(['user_id', 'name']);
});
```

**Adding Columns**:
```php
Schema::table('table_name', function (Blueprint $table) {
    $table->string('new_column')->after('existing_column')->nullable();
    $table->index('new_column');
});
```

**Foreign Keys**:
```php
$table->foreignId('related_id')
    ->constrained('related_table')
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

### 4. Best Practices

**Column Types**:
- Use appropriate types (string vs text)
- Set lengths for strings (255 default)
- Use enum for fixed options
- Use json for flexible data

**Indexes**:
- Add indexes for foreign keys
- Add indexes for frequently searched columns
- Use unique constraints where appropriate
- Consider composite indexes

**Nullability**:
- Make columns nullable if they can be empty
- Use ->default() for non-nullable with defaults
- Don't allow NULL on foreign keys

**Timestamps**:
- Always include ->timestamps() on tables
- Use ->softDeletes() for soft deletable models

### 5. Down Method

Always implement proper rollback:
```php
public function down(): void
{
    Schema::dropIfExists('table_name');
    // or
    Schema::table('table_name', function (Blueprint $table) {
        $table->dropColumn('column_name');
    });
}
```

### 6. Seeder Integration

If creating a new table, consider:
- Do we need a seeder?
- What initial data is required?
- Is it core data or reference data?

### 7. Model Updates

After migration, update model:
- Add to $fillable or $guarded
- Define relationships
- Add casts if needed
- Update factory if exists

### 8. Verification

- Run migration: `./vendor/bin/sail artisan migrate`
- Check database: `./vendor/bin/sail artisan db:show`
- Test rollback: `./vendor/bin/sail artisan migrate:rollback`
- Re-run: `./vendor/bin/sail artisan migrate`

Provide complete migration file and list any related updates needed.
