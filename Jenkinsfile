pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Ananyarchinju/ChatOps-PBL.git'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                bat 'copy "C:\\Users\\basav\\Downloads\\ChatOps-PBL-main (2)\\ChatOps-PBL-main\\backend\\.env" "backend\\.env" /Y'
                bat 'docker compose up -d --build'
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}
