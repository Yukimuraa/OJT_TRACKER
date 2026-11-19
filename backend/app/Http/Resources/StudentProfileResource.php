<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'student_id'         => $this->student_id,
            'start_date'         => $this->start_date
                ? (is_string($this->start_date) ? substr($this->start_date, 0, 10) : $this->start_date->format('Y-m-d'))
                : null,
            'target_end_date'    => $this->target_end_date
                ? (is_string($this->target_end_date) ? substr($this->target_end_date, 0, 10) : $this->target_end_date->format('Y-m-d'))
                : null,
            // Canonical column
            'required_hours'     => $this->required_hours,
            // Frontend alias for required_hours
            'target_hours'       => $this->required_hours,
            'hours_per_day'      => (float) $this->hours_per_day,
            // daily_target_hours alias
            'daily_target_hours' => (float) $this->hours_per_day,
            // working_days stored as lowercase array
            'working_days'       => $this->working_days ?? [],
            'program'            => $this->program,
            'year_level'         => $this->year_level,
            'school_department'  => $this->school_department,
            // Schedule – canonical names
            'morning_enabled'    => (bool) $this->morning_enabled,
            'morning_start'      => $this->morning_start,
            'morning_end'        => $this->morning_end,
            'afternoon_enabled'  => (bool) $this->afternoon_enabled,
            'afternoon_start'    => $this->afternoon_start,
            'afternoon_end'      => $this->afternoon_end,
            'lunch_start'        => $this->lunch_start,
            'lunch_end'          => $this->lunch_end,
            // Schedule – frontend shorthand aliases
            'am_in'              => $this->morning_start  ? substr($this->morning_start, 0, 5)  : null,
            'am_out'             => $this->morning_end    ? substr($this->morning_end, 0, 5)    : null,
            'pm_in'              => $this->afternoon_start ? substr($this->afternoon_start, 0, 5) : null,
            'pm_out'             => $this->afternoon_end  ? substr($this->afternoon_end, 0, 5)  : null,
            // Company / internship
            'company_name'       => $this->company_name ?? $this->company?->name,
            'company_address'    => $this->company_address ?? $this->company?->address,
            'company_department' => $this->company_department,
            'supervisor_name'    => $this->supervisor_name,
            'supervisor_email'   => $this->supervisor_email,
            'internship_role'    => $this->internship_role,
            // Onboarding state
            'onboarding_completed' => (bool) $this->onboarding_completed,
            'onboarding_step'      => (int) $this->onboarding_step,
            'school_name'          => $this->school?->name,
            // Relations
            'school'             => new SchoolResource($this->whenLoaded('school')),
            'company'            => new CompanyResource($this->whenLoaded('company')),
        ];
    }
}
