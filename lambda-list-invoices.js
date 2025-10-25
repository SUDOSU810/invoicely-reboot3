import AWS from "aws-sdk";
const s3 = new AWS.S3();

export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid JSON in request body" }),
      };
    }

    const userId = requestBody.userId || 'anonymous';
    const bucketName = process.env.S3_BUCKET_NAME;

    console.log(`Listing invoices for user: ${userId}`);

    // List all metadata files for this user
    const listParams = {
      Bucket: bucketName,
      Prefix: `invoices/metadata/${userId}_`,
      MaxKeys: 1000
    };

    const listResponse = await s3.listObjectsV2(listParams).promise();
    const objects = listResponse.Contents || [];
    
    console.log(`Found ${objects.length} invoice metadata files`);

    // Fetch each metadata file
    const invoices = [];
    
    for (const obj of objects) {
      if (!obj.Key) continue;
      
      try {
        const getParams = {
          Bucket: bucketName,
          Key: obj.Key
        };
        
        const metadataResponse = await s3.getObject(getParams).promise();
        const metadataText = metadataResponse.Body.toString('utf-8');
        
        if (metadataText) {
          const metadata = JSON.parse(metadataText);
          invoices.push(metadata);
        }
      } catch (error) {
        console.warn(`Failed to fetch metadata for ${obj.Key}:`, error.message);
      }
    }
    
    console.log(`Successfully loaded ${invoices.length} invoices`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Invoices retrieved successfully",
        invoices: invoices,
        count: invoices.length
      }),
    };

  } catch (error) {
    console.error('Error listing invoices:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: "Error retrieving invoices", 
        error: error.message 
      }),
    };
  }
};