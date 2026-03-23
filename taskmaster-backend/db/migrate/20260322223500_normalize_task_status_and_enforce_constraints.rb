class NormalizeTaskStatusAndEnforceConstraints < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      UPDATE tasks
      SET status = 'in_progress'
      WHERE status = 'in-progress';

      UPDATE tasks
      SET status = 'pending'
      WHERE status IS NULL;
    SQL

    change_column_null :tasks, :status, false

    add_check_constraint :tasks,
      "status IN ('pending', 'in_progress', 'done')",
      name: 'tasks_status_check'
  end

  def down
    remove_check_constraint :tasks, name: 'tasks_status_check'

    execute <<~SQL
      UPDATE tasks
      SET status = 'in-progress'
      WHERE status = 'in_progress';
    SQL

    change_column_null :tasks, :status, true
  end
end