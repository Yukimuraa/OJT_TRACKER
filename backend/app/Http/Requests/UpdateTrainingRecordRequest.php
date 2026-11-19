<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTrainingRecordRequest extends FormRequest
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
        $userId = $this->user()->id;
        $record = $this->route('training_record') ?? $this->route('trainingRecord');
        $recordId = is_object($record) ? $record->id : $record;

        return [
            'training_date' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
                Rule::unique('training_records', 'training_date')
                    ->where(fn ($query) => $query->where('user_id', $userId)->whereNull('deleted_at'))
                    ->ignore($recordId),
            ],
            'morning_arrival' => ['nullable', 'date_format:H:i,H:i:s'],
            'morning_departure' => ['nullable', 'date_format:H:i,H:i:s'],
            'afternoon_arrival' => ['nullable', 'date_format:H:i,H:i:s'],
            'afternoon_departure' => ['nullable', 'date_format:H:i,H:i:s'],
            'hours' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'activity_category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'client_updated_at' => ['nullable', 'date'],
            'sync_version' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
