<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE INDEX content_items_type_release_year_index ON content_items(type, release_year DESC)');
        DB::statement('CREATE INDEX user_entries_user_id_status_index ON user_entries(user_id, status)');
        DB::statement('CREATE INDEX user_entries_content_id_index ON user_entries(content_id)');
        DB::statement('CREATE INDEX activity_feed_actor_id_created_at_index ON activity_feed(actor_id, created_at DESC)');
        DB::statement('CREATE INDEX follows_following_id_index ON follows(following_id)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS content_items_type_release_year_index');
        DB::statement('DROP INDEX IF EXISTS user_entries_user_id_status_index');
        DB::statement('DROP INDEX IF EXISTS user_entries_content_id_index');
        DB::statement('DROP INDEX IF EXISTS activity_feed_actor_id_created_at_index');
        DB::statement('DROP INDEX IF EXISTS follows_following_id_index');
    }
};
