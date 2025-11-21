---
description: Create a Laravel Nova resource following PCR Card best practices
---

Create a Laravel Nova 5.x resource following project patterns and best practices.

## Resource Creation Process

### 1. Planning Phase

Ask about:
- **Resource Name**: What model is this for?
- **Fields**: What fields should be displayed?
- **Relationships**: Related resources to include?
- **Actions**: Custom actions needed?
- **Lenses**: Specialized views needed?
- **Filters**: What filtering options?
- **Authorization**: Who can access this resource?

### 2. Create Base Resource

```bash
php artisan nova:resource ResourceName
```

### 3. PCR Card Resource Patterns

Apply these patterns from existing resources:

**Tab Organization** (from SubmissionTradingCard):
```php
use Laravel\Nova\Panel;

public function fields(NovaRequest $request): array
{
    return [
        Panel::make('Overview', [...])->withToolbar(),
        Panel::make('Details', [...])->withToolbar(),
        Panel::make('Relationships', [...])->withToolbar(),
    ];
}
```

**Badge Fields** (use closures, NOT ::make):
```php
use Laravel\Nova\Fields\Badge;
use App\Constants\NovaBadgeType;

Badge::make('Status')
    ->map(fn($value) => match($value) {
        'active' => NovaBadgeType::SUCCESS,
        'pending' => NovaBadgeType::WARNING,
        'inactive' => NovaBadgeType::DANGER,
    })
```

**Select Fields with Constants**:
```php
use Laravel\Nova\Fields\Select;
use App\Constants\CardState;

Select::make('State')->options([
    CardState::ASSESSMENT => 'Assessment',
    CardState::IN_PROGRESS => 'In Progress',
    CardState::QUALITY_CHECK => 'Quality Check',
])
```

**DateTime Fields** (NO ->asHtml()):
```php
DateTime::make('Created At')->exceptOnForms()
```

**Search Configuration**:
```php
public static $search = [
    'id',
    'name',
    // Add searchable fields
];

public static function searchableColumns(): array
{
    return ['id', 'name'];
}
```

### 4. Add Relationships

```php
public function fields(NovaRequest $request): array
{
    return [
        BelongsTo::make('User')->searchable(),
        HasMany::make('Items'),
        BelongsToMany::make('Tags'),
    ];
}
```

### 5. Add Actions

Create custom actions following project patterns:
```bash
php artisan nova:action ActionName
```

### 6. Add Lenses (Optional)

For filtered views:
```bash
php artisan nova:lens LensName
```

### 7. Configure Authorization

In `app/Policies/`:
```php
public function viewAny(User $user): bool
{
    return $user->hasRole(['Admin', 'Technician']);
}
```

### 8. Register Resource

In `NovaServiceProvider`:
```php
Nova::resources([
    \App\Nova\ResourceName::class,
]);
```

### 9. Validation

- Run `./scripts/dev.sh validate:nova-search`
- Test in browser at `/admin/resources/resource-name`
- Verify all fields display correctly
- Test create/edit forms
- Verify relationships work

### 10. Documentation

Add to resource PHPDoc:
```php
/**
 * Resource Name Resource
 *
 * Manages [description] in the Nova admin panel.
 *
 * Features:
 * - Tab-based organization
 * - Badge status indicators
 * - Relationship management
 * - Custom actions: [list]
 *
 * @package App\Nova
 */
```

Provide the complete resource file content and any additional files needed (actions, lenses, policies).
