<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    protected $table = 'activity_feed';
    public $timestamps = false;

    protected $fillable = ['actor_id', 'verb', 'object_id', 'object_type', 'metadata', 'created_at'];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function content()
    {
        return $this->belongsTo(ContentItem::class, 'object_id');
    }
}
