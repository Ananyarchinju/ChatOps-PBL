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

        stage('Run ChatOps') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo 'ChatOps deployed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check console output.'
        }
    }
}
