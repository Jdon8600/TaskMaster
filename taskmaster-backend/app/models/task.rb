class Task < ApplicationRecord
  self.table_name = "tasks"
  
  validates :title, :email_address, presence: true
  validates :status, inclusion: { in: %w[pending in-progress done], message: "must be pending, in-progress, or done" }
  
  belongs_to :user, foreign_key: :email_address, primary_key: :email_address
  
  def as_json(options = {})
    super(options.merge(only: [:id, :title, :description, :due_date, :status, :email_address]))
  end
end
