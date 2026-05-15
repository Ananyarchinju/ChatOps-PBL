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
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t chatops-app .'
            }
        }

        stage('Run ChatOps') {
            steps {
                sh 'docker rm -f chatops-app || true'
                sh 'docker run -d --name chatops-app -p 3000:3000 chatops-app'
            }
        }
    }

    post {
        success {
            echo 'ChatOps application deployed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check console output.'
        }
    }
}
