<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE content_items ALTER COLUMN genres DROP DEFAULT");
        DB::statement("
            ALTER TABLE content_items
            ALTER COLUMN genres TYPE jsonb
            USING COALESCE(to_jsonb(genres), '[]'::jsonb)
        ");
        DB::statement("ALTER TABLE content_items ALTER COLUMN genres SET DEFAULT '[]'::jsonb");
        DB::statement("ALTER TABLE content_items ALTER COLUMN metadata SET DEFAULT '{}'::jsonb");
        DB::statement('ALTER TABLE content_items ALTER COLUMN avg_rating TYPE numeric(4,2)');

        DB::statement('CREATE INDEX IF NOT EXISTS content_items_type_release_year_index ON content_items (type, release_year)');
        DB::statement('CREATE INDEX IF NOT EXISTS content_items_ratings_count_index ON content_items (ratings_count)');

        DB::statement('CREATE INDEX IF NOT EXISTS user_entries_user_id_status_index ON user_entries (user_id, status)');
        DB::statement('CREATE INDEX IF NOT EXISTS user_entries_content_id_index ON user_entries (content_id)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS user_entries_content_id_index');
        DB::statement('DROP INDEX IF EXISTS user_entries_user_id_status_index');
        DB::statement('DROP INDEX IF EXISTS content_items_ratings_count_index');
        DB::statement('DROP INDEX IF EXISTS content_items_type_release_year_index');

        DB::statement("ALTER TABLE content_items ALTER COLUMN genres DROP DEFAULT");
        DB::statement("
            ALTER TABLE content_items
            ALTER COLUMN genres TYPE text[]
            USING '{}'::text[]
        ");
        DB::statement("ALTER TABLE content_items ALTER COLUMN genres SET DEFAULT '{}'");
        DB::statement('ALTER TABLE content_items ALTER COLUMN avg_rating TYPE numeric(3,2)');
    }
};
