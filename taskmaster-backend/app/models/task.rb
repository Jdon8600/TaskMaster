class Task < ApplicationRecord
  self.table_name = "tasks"

  enum :status, {
    pending: "pending",
    in_progress: "in_progress",
    done: "done"
  }, validate: true
  
  validates :title, :email_address, presence: true
  
  belongs_to :user, foreign_key: :email_address, primary_key: :email_address
  
  def as_json(options = {})
    super(options.merge(only: [:id, :title, :description, :due_date, :status, :email_address]))
  end
end
