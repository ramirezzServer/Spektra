<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS pgcrypto');
        DB::statement("CREATE TABLE content_items (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            external_id varchar(100) NOT NULL,
            type varchar(20) NOT NULL CHECK (type IN ('film','series','game','book')),
            title varchar(500) NOT NULL,
            poster_url text NULL,
            release_year smallint NULL,
            genres text[] DEFAULT '{}',
            metadata jsonb DEFAULT '{}',
            avg_rating numeric(3,2) NULL,
            ratings_count integer DEFAULT 0,
            created_at timestamptz NULL,
            updated_at timestamptz NULL,
            UNIQUE (external_id, type)
        )");
    }

    public function down(): void
    {
        Schema::dropIfExists('content_items');
    }
};
