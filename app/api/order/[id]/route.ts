import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/model/order';
import OrderDetail from '@/model/order-detail';
import '@/model/user';
import '@/model/voucher';
import '@/model/variants';
import '@/model/products';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const orderId = params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return NextResponse.json({ message: 'ID đơn hàng không hợp lệ' }, { status: 400 });
  }

  try {
    const order = await Order.findById(orderId)
      .populate('id_user')
      .populate('id_voucher')
      .lean();

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const products = await OrderDetail.find({ id_order: new mongoose.Types.ObjectId(orderId) })
      .populate({
        path: 'id_product_variant',
        populate: {
          path: 'id_product',
        },
      })
      .lean();

    return NextResponse.json({
      ...order,
      products,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết đơn hàng:', error);
    return NextResponse.json(
      { message: 'Lỗi server', error: (error as Error).message },
      { status: 500 }
    );
  }
}
