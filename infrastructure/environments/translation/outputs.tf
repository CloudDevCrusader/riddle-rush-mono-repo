output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.main.id
}

output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.main.public_ip
}

output "url" {
  description = "URL of the Tolgee UI"
  value       = "https://${var.domain_name}"
}

output "ssh_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i <path-to-your-private-key> ec2-user@${aws_eip.main.public_ip}"
}

output "ssm_command" {
  description = "Command to start a session using SSM Session Manager"
  value       = "aws ssm start-session --target ${aws_instance.main.id}"
}
