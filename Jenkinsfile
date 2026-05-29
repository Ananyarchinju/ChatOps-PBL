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

    stage('Check Running Containers') {
        steps {
            sh 'docker ps'
        }
    }

    stage('Build Success') {
        steps {
            echo 'ChatOps-PBL pipeline executed successfully!'
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
