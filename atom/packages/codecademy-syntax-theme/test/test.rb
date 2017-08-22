# Todo List Classes
class List
	def initialize
		@all_tasks = []
	end
	def add_task(task)
		@all_tasks << task
	end

	def show_all_tasks
		@all_tasks
	end

	def save
		list_file = File.open("todo_list.txt", "w")
		@all_tasks.each do |task|
			list_file.puts task.description
		end
	end
end

class Task
	attr_reader :description
	def initialize(description)
		@description = description
	end
end

#Todo List actions
command, *task_description = ARGV

my_list = List.new


File.open("todo_list.txt", "r").each do |line|
	my_list.add_task(Task.new(line))
end

case command
when "add"
	task_string = task_description.join(" ")
	task_obj = Task.new(task_string)
	my_list.add_task(task_obj)
	my_list.save
when "complete"
	# write code that checks a task as complete...
when "print"
	my_list.show_all_tasks.each do |task|
		puts task.description
	end
end
