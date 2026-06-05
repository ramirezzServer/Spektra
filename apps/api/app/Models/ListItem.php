<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ListItem extends Model
{
    use HasFactory;

    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['list_id', 'content_id', 'position', 'added_at'];

    protected $casts = [
        'position' => 'integer',
        'added_at' => 'datetime',
    ];

    public function list()
    {
        return $this->belongsTo(UserList::class, 'list_id');
    }

    public function content()
    {
        return $this->belongsTo(ContentItem::class, 'content_id');
    }
}
