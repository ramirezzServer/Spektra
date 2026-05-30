<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserList extends Model
{
    use HasUuids;

    protected $table = 'lists';
    protected $fillable = ['user_id', 'name', 'description', 'is_public'];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ListItem::class, 'list_id')->orderBy('position');
    }

    public function contents()
    {
        return $this->belongsToMany(ContentItem::class, 'list_items', 'list_id', 'content_id')
            ->withPivot(['position', 'added_at'])
            ->orderBy('list_items.position');
    }
}
