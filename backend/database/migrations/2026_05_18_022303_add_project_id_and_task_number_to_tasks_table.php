<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Link each task to a specific project
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
            
            // Sequential number unique within each project (e.g., #1, #2)
            $table->integer('task_number')->nullable();
            
            // Index for performance when searching tasks by project and number
            $table->index(['project_id', 'task_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn(['project_id', 'task_number']);
        });
    }
};
