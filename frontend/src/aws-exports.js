// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "us-east-1:3bd4a2d4-3e20-4921-a87e-70af418f7ef1",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_gbzCkWTjI",
    "aws_user_pools_web_client_id": "5cujgdp9icptsss4vuudv2kt8h",
    "oauth": {
        "domain": "epsserverlessauth0001-dev.auth.us-east-1.amazoncognito.com",
        "scope": [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "http://localhost:4200/user/",
        "redirectSignOut": "http://localhost:4200/login/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cloud_logic_custom": [
        {
            "name": "api9819f38d",
            "endpoint": "https://ku6y30qtm8.execute-api.us-east-1.amazonaws.com/dev",
            "region": "us-east-1"
        }
    ],
    "aws_content_delivery_bucket": "eps-serverless-20190630232834-hostingbucket-dev",
    "aws_content_delivery_bucket_region": "us-east-1",
    "aws_content_delivery_url": "http://eps-serverless-20190630232834-hostingbucket-dev.s3-website-us-east-1.amazonaws.com",
    "aws_user_files_s3_bucket": "eps-serverlessc5940ff4146a4cbc86df2d32b803996c-dev",
    "aws_user_files_s3_bucket_region": "us-east-1"
};


export default awsmobile;