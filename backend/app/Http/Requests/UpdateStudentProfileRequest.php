<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $profile = $this->user()->studentProfile;
        $schoolId = $this->input('school_id', $profile?->school_id);

        return [
            'school_id'             => ['sometimes', 'nullable', 'integer', 'exists:schools,id'],
            'school_name'           => ['nullable', 'string', 'max:255'],
            'company_id'            => ['nullable', 'integer', 'exists:companies,id'],
            'student_id'            => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('student_profiles', 'student_id')
                    ->where(fn ($query) => $query->where('school_id', $schoolId))
                    ->ignore($profile?->id),
            ],
            // Canonical column names
            'required_hours'        => ['sometimes', 'integer', 'min:1', 'max:2000'],
            'hours_per_day'         => ['sometimes', 'numeric', 'min:0.5', 'max:24'],
            // Frontend aliases (also accepted; mapped in prepareForValidation)
            'target_hours'          => ['sometimes', 'integer', 'min:1', 'max:2000'],
            'daily_target_hours'    => ['sometimes', 'numeric', 'min:0.5', 'max:24'],
            'am_in'                 => ['nullable', 'date_format:H:i,H:i:s'],
            'am_out'                => ['nullable', 'date_format:H:i,H:i:s'],
            'pm_in'                 => ['nullable', 'date_format:H:i,H:i:s'],
            'pm_out'                => ['nullable', 'date_format:H:i,H:i:s'],
            // Date fields
            'start_date'            => ['nullable', 'date'],
            'target_end_date'       => ['nullable', 'date'],
            // Working days – accept both lowercase and title-case
            'working_days'          => ['nullable', 'array'],
            'working_days.*'        => ['string', 'regex:/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i'],
            // Academic info
            'program'               => ['nullable', 'string', 'max:150'],
            'year_level'            => ['nullable', 'string', 'max:50'],
            'school_department'     => ['nullable', 'string', 'max:150'],
            // Company / internship info
            'company_name'          => ['nullable', 'string', 'max:255'],
            'company_address'       => ['nullable', 'string', 'max:500'],
            'company_department'    => ['nullable', 'string', 'max:150'],
            'supervisor_name'       => ['nullable', 'string', 'max:150'],
            'supervisor_email'      => ['nullable', 'email', 'max:255'],
            'internship_role'       => ['nullable', 'string', 'max:150'],
            // Schedule (canonical column names kept for existing tests)
            'morning_enabled'       => ['sometimes', 'boolean'],
            'morning_start'         => ['nullable', 'date_format:H:i,H:i:s'],
            'morning_end'           => ['nullable', 'date_format:H:i,H:i:s'],
            'afternoon_enabled'     => ['sometimes', 'boolean'],
            'afternoon_start'       => ['nullable', 'date_format:H:i,H:i:s'],
            'afternoon_end'         => ['nullable', 'date_format:H:i,H:i:s'],
            'lunch_start'           => ['nullable', 'date_format:H:i,H:i:s'],
            'lunch_end'             => ['nullable', 'date_format:H:i,H:i:s'],
            // Onboarding state
            'onboarding_completed'  => ['sometimes', 'boolean'],
            'onboarding_step'       => ['sometimes', 'integer', 'min:0', 'max:4'],
        ];
    }

    /**
     * Normalize frontend field aliases before validation runs.
     * Maps: am_in → morning_start, am_out → morning_end, etc.
     * Also normalises working_days values to lowercase.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        // Map schedule aliases to canonical column names
        if ($this->has('am_in'))           $merge['morning_start']    = $this->input('am_in');
        if ($this->has('am_out'))          $merge['morning_end']      = $this->input('am_out');
        if ($this->has('pm_in'))           $merge['afternoon_start']  = $this->input('pm_in');
        if ($this->has('pm_out'))          $merge['afternoon_end']    = $this->input('pm_out');

        // Map hours aliases
        if ($this->has('target_hours'))       $merge['required_hours'] = $this->input('target_hours');
        if ($this->has('daily_target_hours')) $merge['hours_per_day']  = $this->input('daily_target_hours');

        // Normalise working_days to lowercase
        if ($this->has('working_days') && is_array($this->input('working_days'))) {
            $merge['working_days'] = array_map('strtolower', $this->input('working_days'));
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }
}

