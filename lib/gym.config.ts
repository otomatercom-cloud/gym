// Gym Town registry (active when NEXT_PUBLIC_APP_MODE=gym). Labels/types/selections still come from Odoo fields_get;
// state buttons come from schema.gym.generated.ts (the module's transition matrices).
import type { Cfg } from './config';

export const GYM_GROUPS = ['Members', 'Operations', 'Training', 'Nutrition', 'Health', 'Finance', 'Setup'] as const;
const M = 'otm.gym.';

export const GYM_CONFIG: Cfg[] = [
  {
    slug: 'members', model: M + 'member', title: 'Members', singular: 'Member', group: 'Members', order: 'id desc',
    columns: ['member_code', 'name', 'phone', 'plan_id', 'membership_expiry', 'trainer_id', 'status'], search: ['name', 'member_code', 'phone', 'email'],
    create: ['name', 'phone', 'whatsapp', 'email', 'date_of_birth', 'gender', 'fitness_goal', 'trainer_id', 'nutritionist_id', 'address', 'emergency_contact', 'emergency_phone', 'rfid_code'],
    sections: [
      { title: 'Member', fields: ['name', 'phone', 'whatsapp', 'email', 'date_of_birth', 'gender', 'fitness_goal', 'trainer_id', 'nutritionist_id', 'rfid_code'] },
      { title: 'Address and emergency', fields: ['address', 'emergency_contact', 'emergency_phone', 'notes'] },
    ],
    extra: [{ method: 'action_create_portal_user', label: 'Create app login', when: (r) => !r.user_id, tone: 'ghost' }],
  },
  {
    slug: 'memberships', model: M + 'membership', title: 'Memberships', singular: 'Membership', group: 'Members', order: 'id desc', prefillToday: ['start_date'],
    columns: ['name', 'member_id', 'plan_id', 'start_date', 'end_date', 'final_amount', 'payment_status', 'state'], search: ['name', 'member_id'],
    create: ['member_id', 'plan_id', 'start_date', 'discount', 'trainer_id'],
    sections: [
      { title: 'Membership', fields: ['member_id', 'plan_id', 'trainer_id', 'start_date', 'end_date', 'days_left', 'renewal_stage', 'renewal_date'] },
      { title: 'Amounts', fields: ['amount', 'discount', 'final_amount', 'payment_status'] },
      { title: 'Freeze', fields: ['freeze_days_requested', 'freeze_start', 'freeze_end', 'freeze_reason'] },
    ],
    tabs: [{ title: 'Payments', model: M + 'payment', field: 'membership_id', columns: ['name', 'amount', 'paid_amount', 'balance', 'due_date', 'state'], link: 'payments' }],
  },
  {
    slug: 'plans', model: M + 'membership.plan', title: 'Plans', singular: 'Plan', group: 'Setup', order: 'sequence',
    columns: ['name', 'plan_type', 'duration', 'duration_unit', 'price', 'joining_fee', 'freeze_allowed'], search: ['name'],
    create: ['name', 'plan_type', 'duration', 'duration_unit', 'price', 'joining_fee', 'included_sessions', 'freeze_allowed', 'freeze_days', 'description'],
    sections: [{ title: 'Plan', fields: ['name', 'plan_type', 'duration', 'duration_unit', 'price', 'joining_fee', 'included_sessions', 'freeze_allowed', 'freeze_days', 'description'] }],
  },
  {
    slug: 'attendance', model: M + 'attendance', title: 'Attendance', singular: 'Attendance', group: 'Operations', order: 'check_in desc',
    columns: ['member_id', 'date', 'check_in', 'check_out', 'duration', 'trainer_id', 'source', 'state'], search: ['member_id'],
    sections: [{ title: 'Visit', fields: ['member_id', 'trainer_id', 'date', 'check_in', 'check_out', 'duration', 'source', 'notes'] }],
  },
  {
    slug: 'appointments', model: M + 'appointment', title: 'Appointments', singular: 'Appointment', group: 'Operations', order: 'start_datetime desc',
    columns: ['name', 'start_datetime', 'member_id', 'trainer_id', 'appointment_type', 'state'], search: ['name', 'member_id'],
    create: ['member_id', 'trainer_id', 'appointment_type', 'start_datetime', 'duration_minutes', 'notes'],
    sections: [{ title: 'Appointment', fields: ['member_id', 'trainer_id', 'appointment_type', 'start_datetime', 'duration_minutes', 'stop_datetime', 'notes'] }],
    extra: [{ method: 'action_create_assessment', label: 'Start assessment', when: (r) => r.appointment_type === 'assessment' && ['confirmed', 'in_progress'].includes(r.state) }],
  },
  {
    slug: 'trainers', model: M + 'trainer', title: 'Trainers', singular: 'Trainer', group: 'Training', stateField: 'status', order: 'name',
    columns: ['name', 'staff_role', 'specialization', 'phone', 'member_count', 'status'], search: ['name', 'phone'],
    create: ['name', 'staff_role', 'user_id', 'specialization', 'certification', 'experience', 'working_hours', 'phone', 'email'],
    sections: [{ title: 'Trainer', fields: ['name', 'staff_role', 'user_id', 'status', 'specialization', 'certification', 'experience', 'working_hours', 'phone', 'email'] }],
  },
  {
    slug: 'exercises', model: M + 'exercise', title: 'Exercises', singular: 'Exercise', group: 'Training', order: 'name',
    columns: ['name', 'muscle_group', 'equipment', 'difficulty'], search: ['name', 'equipment'],
    create: ['name', 'muscle_group', 'equipment', 'difficulty', 'video', 'instructions', 'safety_notes'],
    sections: [{ title: 'Exercise', fields: ['name', 'muscle_group', 'equipment', 'difficulty', 'video', 'instructions', 'safety_notes'] }],
  },
  {
    slug: 'workouts', model: M + 'workout.plan', title: 'Workout Plans', singular: 'Workout plan', group: 'Training', order: 'id desc',
    columns: ['name', 'member_id', 'trainer_id', 'version', 'start_date', 'end_date', 'state'], search: ['name', 'member_id'],
    create: ['member_id', 'trainer_id', 'goal', 'start_date', 'end_date', 'notes'],
    sections: [{ title: 'Plan', fields: ['member_id', 'trainer_id', 'goal', 'start_date', 'end_date', 'version', 'notes'] }],
    tabs: [{ title: 'Exercises', model: M + 'workout.plan.line', field: 'plan_id', columns: ['day', 'day_title', 'exercise_id', 'sets', 'reps', 'weight', 'rest'], create: ['day', 'day_title', 'exercise_id', 'sets', 'reps', 'weight', 'rest', 'notes'] }],
    extra: [{ method: 'action_new_version', label: 'New version', when: (r) => ['approved', 'active'].includes(r.state), tone: 'ghost' }],
  },
  {
    slug: 'foods', model: M + 'food.item', title: 'Food Master', singular: 'Food item', group: 'Nutrition', order: 'name',
    columns: ['name', 'category', 'serving_size', 'unit', 'calories', 'protein', 'carbs', 'fat'], search: ['name'],
    create: ['name', 'category', 'serving_size', 'unit', 'calories', 'protein', 'carbs', 'fat', 'vegetarian'],
    sections: [{ title: 'Food', fields: ['name', 'category', 'serving_size', 'unit', 'calories', 'protein', 'carbs', 'fat', 'vegetarian'] }],
  },
  {
    slug: 'diets', model: M + 'diet.plan', title: 'Diet Plans', singular: 'Diet plan', group: 'Nutrition', order: 'id desc',
    columns: ['name', 'member_id', 'nutritionist_id', 'version', 'calories_target', 'calories_total', 'state'], search: ['name', 'member_id'],
    create: ['member_id', 'goal', 'start_date', 'end_date', 'calories_target', 'protein_target', 'carb_target', 'fat_target', 'water_target', 'notes'],
    sections: [
      { title: 'Plan', fields: ['member_id', 'nutritionist_id', 'trainer_id', 'goal', 'start_date', 'end_date', 'version', 'notes'] },
      { title: 'Targets', fields: ['calories_target', 'protein_target', 'carb_target', 'fat_target', 'water_target'] },
      { title: 'Planned totals', fields: ['calories_total', 'protein_total', 'carb_total', 'fat_total'] },
    ],
    tabs: [{ title: 'Meals', model: M + 'diet.plan.line', field: 'plan_id', columns: ['meal_type', 'food_id', 'quantity', 'calories', 'protein', 'carbs', 'fat'], create: ['meal_type', 'food_id', 'quantity', 'notes'] }],
    extra: [{ method: 'action_new_version', label: 'New version', when: (r) => ['approved', 'active'].includes(r.state), tone: 'ghost' }],
  },
  {
    slug: 'health-profiles', model: M + 'health.profile', title: 'Health Profiles', singular: 'Health profile', group: 'Health', order: 'id desc',
    columns: ['member_id', 'height', 'weight', 'bmi', 'body_fat', 'blood_pressure'], search: ['member_id'],
    create: ['member_id', 'height', 'weight', 'body_fat', 'muscle_mass', 'blood_pressure', 'allergies', 'injuries', 'medical_restrictions', 'fitness_limitations', 'emergency_information', 'notes'],
    sections: [
      { title: 'Vitals', fields: ['member_id', 'height', 'weight', 'bmi', 'bmi_category', 'body_fat', 'muscle_mass', 'blood_pressure'] },
      { title: 'Medical', fields: ['allergies', 'injuries', 'medical_restrictions', 'fitness_limitations', 'emergency_information', 'notes'] },
    ],
  },
  {
    slug: 'assessments', model: M + 'assessment', title: 'Assessments', singular: 'Assessment', group: 'Health', order: 'date desc, id desc',
    columns: ['name', 'member_id', 'date', 'weight', 'bmi', 'body_fat', 'assessor_id', 'state'], search: ['name', 'member_id'],
    create: ['member_id', 'date', 'height', 'weight', 'body_fat', 'muscle_mass', 'chest', 'waist', 'hip', 'arm', 'thigh', 'neck', 'notes', 'recommendations'],
    sections: [
      { title: 'Assessment', fields: ['member_id', 'date', 'assessor_id', 'appointment_id'] },
      { title: 'Body measurements', fields: ['height', 'weight', 'bmi', 'body_fat', 'muscle_mass', 'chest', 'waist', 'hip', 'arm', 'thigh', 'neck'] },
      { title: 'Notes', fields: ['notes', 'recommendations'] },
    ],
    tabs: [{ title: 'Fitness tests', model: M + 'assessment.line', field: 'assessment_id', columns: ['test_name', 'result', 'unit', 'notes'], create: ['test_name', 'result', 'unit', 'notes'] }],
  },
  {
    slug: 'progress-logs', model: M + 'progress', title: 'Progress Logs', singular: 'Progress log', group: 'Health', order: 'date desc, id desc',
    columns: ['date', 'member_id', 'weight', 'bmi', 'body_fat', 'waist', 'source'], search: ['member_id'],
    create: ['member_id', 'date', 'weight', 'body_fat', 'muscle_mass', 'chest', 'waist', 'hip', 'arm', 'thigh', 'notes'],
    sections: [{ title: 'Progress', fields: ['member_id', 'date', 'weight', 'bmi', 'body_fat', 'muscle_mass', 'chest', 'waist', 'hip', 'arm', 'thigh', 'notes'] }],
  },
  {
    slug: 'payments', model: M + 'payment', title: 'Payments', singular: 'Payment', group: 'Finance', order: 'id desc', prefillToday: ['receive_date'],
    columns: ['name', 'member_id', 'kind', 'amount', 'paid_amount', 'balance', 'due_date', 'state'], search: ['name', 'member_id'],
    create: ['member_id', 'membership_id', 'kind', 'description', 'amount', 'discount', 'due_date'],
    sections: [
      { title: 'Charge', fields: ['member_id', 'membership_id', 'kind', 'description', 'amount', 'discount', 'due_date'] },
      { title: 'Settlement', fields: ['paid_amount', 'balance', 'refund_amount'] },
      { title: 'Receive payment (Finance)', fields: ['receive_amount', 'receive_method', 'receive_reference', 'receive_date', 'refund_amount_input'] },
    ],
    tabs: [{ title: 'Receipts', model: M + 'payment.receipt', field: 'payment_id', columns: ['date', 'kind', 'amount', 'method', 'reference', 'confirmed_by_id'], link: 'receipts' }],
  },
  {
    slug: 'receipts', model: M + 'payment.receipt', title: 'Receipts', singular: 'Receipt', group: 'Finance', order: 'id desc',
    columns: ['date', 'payment_id', 'member_id', 'kind', 'amount', 'method', 'reference'], search: ['payment_id', 'member_id', 'reference'],
    sections: [{ title: 'Receipt', fields: ['payment_id', 'member_id', 'kind', 'amount', 'date', 'method', 'reference', 'note', 'confirmed_by_id'] }],
  },
  {
    slug: 'audit', model: M + 'history', title: 'Audit Trail', singular: 'Audit entry', group: 'Setup', order: 'id desc',
    columns: ['date', 'record_name', 'action', 'prev_state', 'new_state', 'user_id', 'reason'], search: ['record_name', 'reason'],
    sections: [{ title: 'Entry', fields: ['record_name', 'res_model', 'res_id', 'action', 'prev_state', 'new_state', 'user_id', 'date', 'reason'] }],
  },
];
