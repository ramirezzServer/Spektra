<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follow extends Model
{
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['follower_id', 'following_id', 'created_at'];
}
