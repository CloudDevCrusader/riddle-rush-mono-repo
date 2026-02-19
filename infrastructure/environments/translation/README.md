# Translation Environment - Tolgee Hosting

This directory contains the Terraform configuration for hosting the Tolgee translation management UI on AWS.

## Purpose

This infrastructure provides a persistent, internet-accessible instance of Tolgee at **https://translation.riddlerush.de**. It allows team members to manage i18n translations for the Riddle Rush application using a web interface without needing to run Docker locally.

## Architecture

The architecture is designed to be simple, maintainable, and cost-efficient.

```
+-------------------------------------------------+
|               Route53 Zone                      |
|                riddlerush.de                    |
+-----------------------+-------------------------+
                        | A Record: translation.riddlerush.de
                        v
+-----------------------+-------------------------+
|                Elastic IP (static)              |
+-----------------------+-------------------------+
                        |
                        v
+-------------------------------------------------+
|      EC2 Instance (t4g.small, ARM/Graviton)     |
|                                                 |
|  +------------------+      +------------------+ |
|  | Caddy Web Server |----->|  Tolgee Docker   | |
|  | (Auto HTTPS)     | proxy|  Container       | |
|  +------------------+      +------------------+ |
|                                |                |
|                                v                |
|                          +------------------+   |
|                          | EBS Volume (20GB)|   |
|                          | (Persistent Data)|   |
|                          +------------------+   |
+-------------------------------------------------+
```

- **EC2 Instance**: A `t4g.small` ARM-based instance provides 2 vCPU and 2 GB of RAM, which is ample for the Tolgee Java application and its embedded database. ARM/Graviton instances offer a significant price/performance advantage.
- **EBS Volume**: A 20GB `gp3` Elastic Block Store volume is attached as the root device. This provides persistent storage for the Tolgee database, ensuring data survives instance restarts.
- **Caddy Web Server**: Caddy is installed on the host and acts as a reverse proxy. It automatically provisions and renews a free SSL certificate from Let's Encrypt, providing HTTPS for `translation.riddlerush.de`.
- **Docker**: The Tolgee application itself runs as a Docker container, managed by Docker Compose. This simplifies deployment and updates.
- **Elastic IP**: A static IP address ensures the DNS record doesn't need to be updated if the instance is stopped and started.
- **Security Group**: Firewall rules restrict access to standard web ports (80/443) and SSH (port 22).

## Estimated Cost

This setup is highly cost-effective:

- **EC2 t4g.small**: ~$13.50 / month
- **EBS 20GB gp3**: ~$1.60 / month
- **Elastic IP**: Free while attached to a running instance.
- **Data Transfer**: Falls within the AWS Free Tier for most months.

**Total: ~ $15-16 / month**

## Prerequisites

1.  **AWS CLI**: Configured with credentials for the target AWS account.
2.  **Terraform**: Version `~> 1.5.0` installed.
3.  **SSH Key Pair**: You must have an SSH key pair. The public key will be provided to Terraform to grant you access to the EC2 instance.

## Setup & Deployment

1.  **Copy Example Variables**:

    ```bash
    cp infrastructure/environments/translation/terraform.tfvars.example infrastructure/environments/translation/terraform.tfvars
    ```

2.  **Edit `terraform.tfvars`**:
    Open `infrastructure/environments/translation/terraform.tfvars` and fill in the required values:
    - `ssh_public_key`: Your full public SSH key (e.g., contents of `~/.ssh/id_ed25519.pub`).
    - `tolgee_admin_password`: A strong, unique password for the Tolgee `admin` user.
    - `ssh_allowed_cidr`: For better security, replace `0.0.0.0/0` with your personal IP address (e.g., `["YOUR_IP/32"]`).

3.  **Initialize Terraform**:
    From the monorepo root:

    ```bash
    pnpm infra:translation:init
    ```

4.  **Plan the Deployment**:
    Review the changes Terraform will make:

    ```bash
    pnpm infra:translation:plan
    ```

5.  **Apply the Changes**:
    Create the AWS resources:
    ```bash
    pnpm infra:translation:apply
    ```
    Type `yes` when prompted to confirm. The process will take a few minutes.

## Post-Deployment

- Once `apply` is complete, the `url` output will show `https://translation.riddlerush.de`.
- It may take an additional 1-2 minutes for the user-data script to finish installing software and for Caddy to provision the SSL certificate.
- You can then access the URL in your browser and log in with username `admin` and the password you set.

## Maintenance

### Updating Tolgee

To update to the latest version of the Tolgee Docker image:

1.  **SSH into the instance**:
    ```bash
    # Get the command from Terraform outputs
    terraform output -state=infrastructure/environments/translation/terraform.tfstate ssh_command
    ```
2.  **Pull the latest image and restart**:
    ```bash
    cd /opt/tolgee
    docker compose pull
    docker compose up -d
    ```

### Teardown

To destroy all resources created by this configuration:

```bash
cd infrastructure/environments/translation
terraform destroy
```
