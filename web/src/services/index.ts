/**
 * Shop Services - Ecommerce functionality
 *
 * Exports all ecommerce services built on the 6-dimension ontology
 */

export type { Cart, CartItem, CartItemMetadata } from "./CartService";
export { CartService } from "./CartService";
export type {
	CreateOrderInput,
	OrderItem,
	OrderProperties,
	OrderStatus,
	ShippingAddress,
} from "./OrderService";
export { OrderService } from "./OrderService";
export type {
	CreateProductInput,
	ProductProperties,
	ProductVariant,
	UpdateProductInput,
} from "./ProductService";
export { ProductService } from "./ProductService";
export type {
	CreateReviewInput,
	Review,
	ReviewProperties,
	UpdateReviewInput,
} from "./ReviewService";
export { ReviewService } from "./ReviewService";
