<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingRecordResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $morningTimeIn = $this->morning_arrival ? substr($this->morning_arrival, 0, 5) : '';
        $morningTimeOut = $this->morning_departure ? substr($this->morning_departure, 0, 5) : '';
        $afternoonTimeIn = $this->afternoon_arrival ? substr($this->afternoon_arrival, 0, 5) : '';
        $afternoonTimeOut = $this->afternoon_departure ? substr($this->afternoon_departure, 0, 5) : '';

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'training_date' => $this->training_date?->format('Y-m-d'),
            'date' => $this->training_date?->format('Y-m-d'),
            'morning_arrival' => $this->morning_arrival,
            'morning_departure' => $this->morning_departure,
            'afternoon_arrival' => $this->afternoon_arrival,
            'afternoon_departure' => $this->afternoon_departure,
            'hours' => (float) $this->hours,
            'activity_category' => $this->activity_category,
            'activity' => $this->activity_category,
            'description' => $this->description,
            'client_updated_at' => $this->client_updated_at?->toISOString(),
            'sync_version' => (int) ($this->sync_version ?? 1),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'morningSession' => [
                'attended' => !empty($this->morning_arrival),
                'timeIn' => $morningTimeIn,
                'timeOut' => $morningTimeOut,
            ],
            'afternoonSession' => [
                'attended' => !empty($this->afternoon_arrival),
                'timeIn' => $afternoonTimeIn,
                'timeOut' => $afternoonTimeOut,
            ],
        ];
    }
}
