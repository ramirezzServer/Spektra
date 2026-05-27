<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListItem extends Model
{
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['list_id', 'content_id', 'position', 'added_at'];

    public function list()
    {
        return $this->belongsTo(UserList::class, 'list_id');
    }

    public function content()
    {
        return $this->belongsTo(ContentItem::class, 'content_id');
    }
}
