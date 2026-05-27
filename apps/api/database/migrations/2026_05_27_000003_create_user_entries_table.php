<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE TABLE user_entries (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
            status varchar(20) NOT NULL CHECK (status IN ('want','in_progress','done')),
            rating smallint CHECK (rating BETWEEN 1 AND 10) NULL,
            review text NULL,
            created_at timestamptz NULL,
            updated_at timestamptz NULL,
            UNIQUE (user_id, content_id)
        )");
    }

    public function down(): void
    {
        Schema::dropIfExists('user_entries');
    }
};
