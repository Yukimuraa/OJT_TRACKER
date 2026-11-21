<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DttrTemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $scope = 'system';
        if ($this->user_id !== null) {
            $scope = 'user';
        } elseif ($this->school_id !== null) {
            $scope = 'school';
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'school_id' => $this->school_id,
            'name' => $this->name,
            'description' => $this->description,
            'file_path' => $this->file_path,
            'file_name' => $this->file_name ?: ($this->name . '.' . ($this->template_type ?: 'pdf')),
            'file_size_kb' => $this->file_size_kb,
            'field_map' => $this->field_map ?: [],
            'template_type' => $this->template_type,
            'is_active' => (bool) $this->is_active,
            'scope' => $scope,
            'file_url' => $this->file_path ? "/api/dttr-templates/{$this->id}/file" : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'school' => new SchoolResource($this->whenLoaded('school')),
        ];
    }
}
