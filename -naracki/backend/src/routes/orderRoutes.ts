import { Router, Request, Response } from 'express';
import { db, spacesClient, BUCKET_NAME, pgp } from '../server.js';
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// Define interfaces (simplified for backend context)
interface Order {
  id?: string;
  order_number?: number;
  customerName: string;
  address: { street: string; city: string; };
  phoneNumber: string;
  totalPrice: number;
  notes?: string;
  timestamp?: string;
  status?: string;
  attachments?: Attachment[];
  trackingCode?: string;
}

interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
}

// Middleware to parse multipart/form-data for file uploads
// Note: For production, consider a dedicated multipart parser like 'multer'
// For simplicity in this example, we'll assume files are sent as base64 or similar if needed,
// but typically, file uploads require a specific handling mechanism.
// For now, let's assume the frontend will send attachment data (e.g., URL after direct upload to DO Spaces)
// and the backend will only handle database updates for attachments.

// Helper to upload file buffer to DO Spaces (if direct upload is not used)
const uploadFileToSpaces = async (fileBuffer: Buffer, filePath: string, contentType: string) => {
  if (!BUCKET_NAME) {
    throw new Error("DigitalOcean Spaces bucket name is not configured.");
  }
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: "public-read", // Adjust ACL as needed
  });
  await spacesClient.send(putCommand);
  return `${process.env.VITE_DO_SPACES_ENDPOINT}/${filePath}`;
};

// Add a new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const order: Order = req.body.order; // Assuming order data is in req.body.order
    const files: { name: string; type: string; data: string }[] = req.body.files || []; // Assuming files as base64

    const orderData = await db.one(
      `INSERT INTO orders(
        customer_name, street, city, phone_number, total_price, notes,
        timestamp, status, tracking_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, order_number, tracking_code`,
      [
        order.customerName,
        order.address.street,
        order.address.city,
        order.phoneNumber,
        order.totalPrice,
        order.notes,
        new Date().toISOString(),
        order.status || "New",
        order.trackingCode || null,
      ],
    );

    const realOrderId = orderData.id;
    const realOrderNumber = orderData.order_number;
    const realTrackingCode = orderData.tracking_code;

    // Handle attachments
    const attachmentsWithUrls: Attachment[] = [];
    for (const file of files) {
        const id = uuidv4();
        const filePath = `attachments/${realOrderId}/${file.name}`;
        const fileBuffer = Buffer.from(file.data, 'base64');
        const url = await uploadFileToSpaces(fileBuffer, filePath, file.type);

        attachmentsWithUrls.push({
            id,
            type: file.type.startsWith("image/") ? "image" : "document",
            url,
            name: file.name,
        });
    }

    if (attachmentsWithUrls.length > 0) {
      const cs = new pgp.helpers.ColumnSet(['order_id', 'type', 'url', 'name']);
      const values = attachmentsWithUrls.map((attachment) => ({
        order_id: realOrderId,
        type: attachment.type,
        url: attachment.url,
        name: attachment.name,
      }));
      const insert = pgp.helpers.insert(values, cs, 'attachments');
      await db.none(insert);
    }

    res.status(201).json({ id: realOrderId, order_number: realOrderNumber, trackingCode: realTrackingCode });
  } catch (error: any) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Error adding order", error: error.message });
  }
});

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; // Increased default limit
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    // First, get the orders with basic info (faster query)
    let ordersQuery = `
      SELECT
        o.id,
        o.order_number,
        o.customer_name AS "customerName",
        o.street AS "address.street",
        o.city AS "address.city",
        o.phone_number AS "phoneNumber",
        o.total_price AS "totalPrice",
        o.notes,
        o.timestamp,
        o.status,
        o.tracking_code AS "trackingCode"
      FROM orders o
    `;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`o.status = $${paramIndex++}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      ordersQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    ordersQuery += `
      ORDER BY o.timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM orders';
    if (status) {
      countQuery += ' WHERE status = $1';
    }
    const countResult = await db.one(countQuery, status ? [status] : []);
    const total = parseInt(countResult.count, 10);

    // Execute the optimized orders query
    const ordersData = await db.any(ordersQuery, values);

    // If we have orders, fetch attachments separately (only for orders we're returning)
    let attachmentsData: any[] = [];
    if (ordersData.length > 0) {
      const orderIds = ordersData.map(order => order.id);
      const placeholders = orderIds.map((_, index) => `$${index + 1}`).join(',');
      
      attachmentsData = await db.any(
        `SELECT order_id, id, type, url, name FROM attachments WHERE order_id IN (${placeholders})`,
        orderIds
      );
    }

    // Manually reconstruct the nested address and attachments
    const mappedOrders: Order[] = ordersData.map((item: any) => {
      const attachments = attachmentsData
        .filter(att => att.order_id === item.id)
        .map((att: any) => ({
          id: att.id,
          type: att.type,
          url: att.url,
          name: att.name,
        }));

      return {
        id: item.id,
        order_number: item.order_number,
        customerName: item.customerName,
        address: {
          street: item['address.street'],
          city: item['address.city'],
        },
        phoneNumber: item.phoneNumber,
        totalPrice: parseFloat(item.totalPrice),
        notes: item.notes,
        timestamp: item.timestamp,
        status: item.status,
        attachments: attachments,
        trackingCode: item.trackingCode || undefined,
      };
    });

    res.status(200).json({ orders: mappedOrders, total });
  } catch (error: any) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Error getting orders", error: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.none(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      [status, id],
    );
    res.status(200).json({ message: `Order ${id} status updated to ${status}` });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
});

// Delete an order by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First, delete attachments from DigitalOcean Space
    const attachments = await db.any(
      `SELECT url FROM attachments WHERE order_id = $1`,
      [id],
    );

    await Promise.all(attachments.map(async (attachment: { url: string }) => {
      const urlParts = attachment.url.split('/');
      // The path in the bucket starts after the bucket name
      // Example URL: https://order-attachments.fra1.digitaloceanspaces.com/attachments/order-id/file.name
      if (!BUCKET_NAME) {
        throw new Error("DigitalOcean Spaces bucket name is not configured.");
      }
      const filePath = urlParts.slice(urlParts.indexOf(BUCKET_NAME) + 1).join('/');

      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });
      try {
        await spacesClient.send(deleteCommand);
      } catch (spaceError: any) {
        // Log the error but don't stop the deletion of the order in DB
        console.error(`Error deleting file ${filePath} from Space:`, spaceError.message || spaceError);
      }
    }));

    // Then, delete the order and its attachments from PostgreSQL (ON DELETE CASCADE will handle attachments table)
    await db.none(
      `DELETE FROM orders WHERE id = $1`,
      [id],
    );
    res.status(200).json({ message: `Order ${id} and its attachments deleted.` });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
});

export default router; 