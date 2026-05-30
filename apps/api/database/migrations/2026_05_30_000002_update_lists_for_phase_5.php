<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE lists ALTER COLUMN is_public SET DEFAULT false');
        DB::statement('CREATE INDEX IF NOT EXISTS lists_user_id_index ON lists(user_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS lists_user_id_updated_at_index ON lists(user_id, updated_at DESC)');
        DB::statement('CREATE INDEX IF NOT EXISTS lists_user_id_is_public_index ON lists(user_id, is_public)');
        DB::statement('CREATE INDEX IF NOT EXISTS list_items_list_id_position_index ON list_items(list_id, position)');
        DB::statement('CREATE INDEX IF NOT EXISTS list_items_content_id_index ON list_items(content_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS content_items_type_ratings_count_index ON content_items(type, ratings_count DESC)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE lists ALTER COLUMN is_public SET DEFAULT true');
        DB::statement('DROP INDEX IF EXISTS lists_user_id_index');
        DB::statement('DROP INDEX IF EXISTS lists_user_id_updated_at_index');
        DB::statement('DROP INDEX IF EXISTS lists_user_id_is_public_index');
        DB::statement('DROP INDEX IF EXISTS list_items_list_id_position_index');
        DB::statement('DROP INDEX IF EXISTS list_items_content_id_index');
        DB::statement('DROP INDEX IF EXISTS content_items_type_ratings_count_index');
    }
};
