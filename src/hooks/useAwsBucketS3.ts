import { useState } from 'react';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Custom hook to interact with an AWS S3 bucket.
 *
 * @param {string} key - The key of the object to fetch from the S3 bucket.
 * @param {string} [bucketName] - The name of the S3 bucket. Defaults to the `AWS_BUCKET_NAME` environment variable if not provided.
 * @param {string} [prefix] - The prefix of the object to fetch from the S3 bucket.
 * @param {string} [region] - The AWS region of the S3 bucket. Defaults to the `AWS_REGION` environment variable if not provided.
 * @returns {Object} An object containing the `downloadS3` function, `data`, `loading`, and `error` states.
 * @returns {Function} return.downloadS3 - Function to initiate the download from S3.
 * @returns {Object|null} return.data - The data fetched from the S3 bucket.
 * @returns {boolean} return.loading - Loading state indicating if the download is in progress.
 * @returns {string|null} return.error - Error state containing any error message encountered during the download.
 */
export function useAwsBucketS3(key: string, prefix?: string, bucketName?: string, region?: string) : {
    downloadS3: () => Promise<void>;
    data: object | null;
    loading: boolean;
    error: string | null
} {

    const [data, setData] = useState<object | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Use the provided region and bucketName or fallback to the environment variables.
    const r = region ?? process.env.AWS_REGION;
    const b = bucketName ?? process.env.AWS_BUCKET_NAME;
    const file = `${prefix ?? ''}/${key}`;

    // Fetches the object from the S3 bucket.
    const downloadS3 = async () => {
        // If the region or bucketName is not provided, set the error state and return.
        const s3 = new S3Client({ region: r});
        // Create a new S3 client with the provided region.
        const command = new GetObjectCommand({ Bucket: b, Key: file });

        try {
            // Fetch the object from the S3 bucket.
            const response = await s3.send(command);
            // Transform the response body to a string and parse it to JSON.
            const body = await response.Body?.transformToString();
            if (body) {
                setData(JSON.parse(body));
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return { downloadS3, data, loading, error };
}