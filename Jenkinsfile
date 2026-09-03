pipeline {
    agent {
        label 'lomtech-internal-agent'
    }

    environment {
        workspace = "juspeace-mono-develop"
        vault_cli = credentials('vault-cli')
        vault_addr = credentials('vault-addr')
        vault_path = "juspeace-mono-develop"
        vault_path_fe_env = "juspeace-mono-develop/fe"
        vault_path_be_env = "juspeace-mono-develop/be"
        vault_path_admin_fe_env = "juspeace-mono-develop/admin-fe"
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
                        echo "Generating .env files from Vault secrets..."
                        ${vault_cli} ${vault_path} > .env
                        ${vault_cli} ${vault_path_be_env} > juspeace-be/.env
                        ${vault_cli} ${vault_path_fe_env} > juspeace-fe/.env
                        ${vault_cli} ${vault_path_admin_fe_env} > juspeace-admin-fe/.env
                    """
                }
            }
        }

        stage('Docker Compose Down') {
            steps {
                ws("${workspace}") {
                    sh """
                        echo "Stopping existing Compose stack if any..."
                        docker compose down --remove-orphans || true
                    """
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                ws("${workspace}") {
                    sh """
                        echo "Building Compose services: postgres, mailpit, juspeace-be, juspeace-fe, juspeace-admin-fe..."
                        docker compose build
                    """
                }
            }
        }

        stage('Docker Compose Up') {
            steps {
                ws("${workspace}") {
                    sh """
                        echo "Starting full Compose stack..."
                        docker compose up -d
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
            echo "Build or deployment failed. Please check logs."
        }
        success {
            echo "juspeace-mono deployed successfully with Docker Compose."
        }
    }
}
