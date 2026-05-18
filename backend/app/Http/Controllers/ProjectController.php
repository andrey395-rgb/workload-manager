<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of all active projects.
     */
    public function index()
    {
        // Return all projects, ordered by most recent
        return response()->json([
            'projects' => Project::latest()->get()
        ], 200);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request)
    {
        // 1. Basic validation for new project entry
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // 2. Provision the project node
        $project = Project::create([
            'name' => $fields['name'],
            'description' => $fields['description'] ?? null,
        ]);

        // 3. Confirm creation to the client
        return response()->json([
            'message' => 'Project initialized successfully',
            'project' => $project
        ], 201);
    }

    /**
     * Display the specified project with its associated tasks.
     */
    public function show($id)
    {
        // Find the project and eager load all its tasks with their assigned users
        $project = Project::with(['tasks.users'])->findOrFail($id);

        return response()->json([
            'project' => $project
        ], 200);
    }
}
