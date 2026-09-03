pipeline {
    agent {
        label 'lomtech-internal-agent'
    }

    environment {
        compose_service_name = "web"
        workspace = "juspeace-mono-develop"
        COMPOSE_CONTAINER_NAME = "${workspace}-${compose_service_name}"
        vault_cli = credentials('vault-cli')
        vault_addr = credentials('vault-addr')
        vault_path = "juspeace-mono-develop"
        vault_path_fe_env = "juspeace-mono-develop/fe"
        vault_path_be_env = "juspeace-mono-develop/be"
        vault_path_admin_fe_env = "juspeace-mono-develop/admin-fe"
    }

    tools {
        nodejs "my-NodeJS"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                ws("${workspace}") {
                    git branch: 'develop',
                        credentialsId: 'github-lomtech',
                        url: 'git@github.com:Lomtech-Global/juspeace-mono.git'
                }
            }
        }

        stage("Generate .env") {
            steps {
                ws("${workspace}") {
                    sh """
                        export VAULT_ADDR=${vault_addr}
                        echo "Generating .env file from Vault secrets..."
                        ${vault_cli} ${vault_path_fe_env} > juspeace-fe/.env
                        ${vault_cli} ${vault_path_be_env} > juspeace-be/.env
                        ${vault_cli} ${vault_path_admin_fe_env} > juspeace-admin-fe/.env
                        ${vault_cli} ${vault_path} > .env
                    """
                }
            }
        }

        stage('Docker Compose Down & Build') {
            steps {
                ws("${workspace}") {
                    sh """
                        echo "Stopping existing containers if any..."
                        docker compose down || true

                        echo "Building Docker Compose service..."
                        docker compose build ${compose_service_name}
                    """
                }
            }
        }

        stage('Docker Compose Up') {
            steps {
                ws("${workspace}") {
                    sh """
                        echo "Starting Docker Compose service..."
                        docker compose up -d ${compose_service_name}
                    """
                }
            }
        }
    }

    post {
        always {
            ws("${workspace}") {
                sh "docker compose ps || true"
            }
        }
        failure {
            echo "❌ Build or Deployment failed. Please check logs."
        }
        success {
            echo "✅ juspeace-mono deployed successfully with Docker Compose!"
        }
    }
}
