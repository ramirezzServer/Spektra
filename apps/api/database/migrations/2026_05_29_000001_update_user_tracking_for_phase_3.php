<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE INDEX IF NOT EXISTS user_entries_user_id_status_phase3_index ON user_entries(user_id, status)');
        DB::statement('CREATE INDEX IF NOT EXISTS user_entries_user_id_updated_at_phase3_index ON user_entries(user_id, updated_at DESC)');
        DB::statement('CREATE INDEX IF NOT EXISTS user_entries_content_id_phase3_index ON user_entries(content_id)');
        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS user_entries_user_id_content_id_phase3_unique ON user_entries(user_id, content_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS content_items_type_phase3_index ON content_items(type)');
        DB::statement('CREATE INDEX IF NOT EXISTS content_items_ratings_count_phase3_index ON content_items(ratings_count DESC)');
        DB::statement('CREATE INDEX IF NOT EXISTS activity_feed_actor_id_created_at_phase3_index ON activity_feed(actor_id, created_at DESC)');
        DB::statement('CREATE INDEX IF NOT EXISTS activity_feed_object_id_object_type_phase3_index ON activity_feed(object_id, object_type)');

        DB::statement("
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'user_entries_status_phase3_check'
                ) THEN
                    ALTER TABLE user_entries
                    ADD CONSTRAINT user_entries_status_phase3_check
                    CHECK (status IN ('want','in_progress','done'));
                END IF;
            END
            $$;
        ");

        DB::statement("
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'user_entries_rating_phase3_check'
                ) THEN
                    ALTER TABLE user_entries
                    ADD CONSTRAINT user_entries_rating_phase3_check
                    CHECK (rating IS NULL OR rating BETWEEN 1 AND 10);
                END IF;
            END
            $$;
        ");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS user_entries_user_id_status_phase3_index');
        DB::statement('DROP INDEX IF EXISTS user_entries_user_id_updated_at_phase3_index');
        DB::statement('DROP INDEX IF EXISTS user_entries_content_id_phase3_index');
        DB::statement('DROP INDEX IF EXISTS user_entries_user_id_content_id_phase3_unique');
        DB::statement('DROP INDEX IF EXISTS content_items_type_phase3_index');
        DB::statement('DROP INDEX IF EXISTS content_items_ratings_count_phase3_index');
        DB::statement('DROP INDEX IF EXISTS activity_feed_actor_id_created_at_phase3_index');
        DB::statement('DROP INDEX IF EXISTS activity_feed_object_id_object_type_phase3_index');
        DB::statement('ALTER TABLE user_entries DROP CONSTRAINT IF EXISTS user_entries_status_phase3_check');
        DB::statement('ALTER TABLE user_entries DROP CONSTRAINT IF EXISTS user_entries_rating_phase3_check');
    }
};
