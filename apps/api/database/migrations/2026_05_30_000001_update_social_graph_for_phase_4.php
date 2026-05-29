<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE INDEX IF NOT EXISTS follows_follower_id_phase4_index ON follows(follower_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS follows_following_id_phase4_index ON follows(following_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS follows_created_at_phase4_index ON follows(created_at DESC)');
        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS follows_follower_id_following_id_phase4_unique ON follows(follower_id, following_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS activity_feed_actor_id_created_at_phase4_index ON activity_feed(actor_id, created_at DESC)');
        DB::statement('CREATE INDEX IF NOT EXISTS activity_feed_created_at_phase4_index ON activity_feed(created_at DESC, id DESC)');
        DB::statement('CREATE INDEX IF NOT EXISTS activity_feed_object_type_object_id_phase4_index ON activity_feed(object_type, object_id)');

        DB::statement("
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'follows_no_self_phase4_check'
                ) THEN
                    ALTER TABLE follows
                    ADD CONSTRAINT follows_no_self_phase4_check
                    CHECK (follower_id <> following_id);
                END IF;
            END
            $$;
        ");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS follows_follower_id_phase4_index');
        DB::statement('DROP INDEX IF EXISTS follows_following_id_phase4_index');
        DB::statement('DROP INDEX IF EXISTS follows_created_at_phase4_index');
        DB::statement('DROP INDEX IF EXISTS follows_follower_id_following_id_phase4_unique');
        DB::statement('DROP INDEX IF EXISTS activity_feed_actor_id_created_at_phase4_index');
        DB::statement('DROP INDEX IF EXISTS activity_feed_created_at_phase4_index');
        DB::statement('DROP INDEX IF EXISTS activity_feed_object_type_object_id_phase4_index');
        DB::statement('ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_no_self_phase4_check');
    }
};
