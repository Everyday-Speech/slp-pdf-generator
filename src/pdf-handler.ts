import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('This is a log from the lambda, it should show at New Relic');
    var html_to_pdf = require('html-pdf-node');
    let options = { format: 'A4' };
    let file = { content: '<h1>Welcome to html-pdf-node</h1>' };

    const pdfBuffer = html_to_pdf.generatePdf(file, options);
    console.log('PDF Buffer:-', pdfBuffer);

    return {
        statusCode: 200,
        body: pdfBuffer,
    };
};
