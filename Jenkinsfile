pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Ananyarchinju/ChatOps-PBL.git'
            }
        }

        stage('Check Docker') {
            steps {
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh '''
                docker compose down || true
                '''
            }
        }

        stage('Build Containers') {
            steps {
                sh '''
                docker compose build
                '''
            }
        }

        stage('Run ChatOps Application') {
            steps {
                sh '''
                docker compose up -d
                '''
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'ChatOps-PBL deployed successfully!'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}
