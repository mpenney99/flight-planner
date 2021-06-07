@Library('unifly-jenkins-common') _

pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(
                logRotator(
                    // number of build logs to keep
                    numToKeepStr:'50',
                    // history to keep in days
                    daysToKeepStr: '60',
                    // number of builds have their artifacts kept
                    artifactNumToKeepStr: '1'
                )
            )
        disableConcurrentBuilds()
        skipStagesAfterUnstable()
    }

    environment {
        GIT_REPO = 'https://github.com/unifly-aero/flight-planner.git'
        CREDENTIALS_ID = 'unifly-jenkins'
        JAVA_HOME="${tool 'openjdk-11'}"
        NODE_HOME="${tool 'nodejs-12'}"
        PATH="${env.NODE_HOME}:${env.JAVA_HOME}/bin:${env.PATH}"
        ORG_GRADLE_PROJECT_uniflyVersionTargetBranch="${env.BRANCH_NAME}"
        UNIFLY_ARTIFACTORY = credentials('unifly-artifactory')
        ORG_GRADLE_PROJECT_artifactoryUser = "$UNIFLY_ARTIFACTORY_USR"
        ORG_GRADLE_PROJECT_artifactoryPassword = "$UNIFLY_ARTIFACTORY_PSW"
    }

    stages {
        stage('Docker') {
            when { not { changeRequest() } }
            steps {
                script {
                    withCredentials([azureServicePrincipal('azure-acr-jenkins')]) {
                          sh '''
                            az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET -t $AZURE_TENANT_ID
                            az account set -s $AZURE_SUBSCRIPTION_ID
                            az acr login --name unifly
                          '''
                        }
                    def image = docker.build("unifly.azurecr.io/flight-planner:latest", ".")
                    image.push();
                }
            }
        }

        stage('Restart Web-App') {
            when { not { changeRequest() } }
            steps {
                script {
                     sh 'az webapp restart --name flight-planner -g flight-planner --subscription Pay-As-You-Go-Dev'
                }
            }
        }
    }

    post {
        failure {
            sendSummary("#product-team")
        }
        fixed {
            sendSummary("#product-team")
        }
    }
}
