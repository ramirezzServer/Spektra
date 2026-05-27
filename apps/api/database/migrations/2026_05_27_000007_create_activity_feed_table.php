<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE TABLE activity_feed (
            id bigserial PRIMARY KEY,
            actor_id uuid REFERENCES users(id) ON DELETE CASCADE,
            verb varchar(30) NOT NULL CHECK (verb IN ('rated','reviewed','added_to_list','followed','status_changed')),
            object_id uuid NOT NULL,
            object_type varchar(50) NOT NULL,
            metadata jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now()
        )");
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_feed');
    }
};
