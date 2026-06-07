<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE TABLE list_items (
            list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
            content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
            position smallint DEFAULT 0,
            added_at timestamptz DEFAULT now(),
            PRIMARY KEY (list_id, content_id)
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('list_items');
    }
};
