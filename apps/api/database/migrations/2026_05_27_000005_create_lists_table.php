<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE TABLE lists (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            name varchar(200) NOT NULL,
            description text NULL,
            is_public boolean DEFAULT true,
            created_at timestamptz NULL,
            updated_at timestamptz NULL
        )");
    }

    public function down(): void
    {
        Schema::dropIfExists('lists');
    }
};
