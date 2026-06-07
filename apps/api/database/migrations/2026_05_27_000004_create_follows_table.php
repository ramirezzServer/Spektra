<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE TABLE follows (
            follower_id uuid REFERENCES users(id) ON DELETE CASCADE,
            following_id uuid REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamptz DEFAULT now(),
            PRIMARY KEY (follower_id, following_id),
            CHECK (follower_id != following_id)
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
