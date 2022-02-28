import{
    Context,
    ContractDefinition,
    ContractMessageRequest,
    ContractMessageResponse,
    ContractQueryRequest
} from '@stakeordie/griptape.js';

export interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
}

export interface Token {
    contract_address: string;
    token_info: TokenInfo;
}

export interface AuctionInfo {
    sell_token: Token;
    bid_token: Token;
    sell_amount: string;
    minimum_bid: string;
    description: string;
    auction_address: string;
    ends_at: string;
    status: string;
};

export interface AuctionInfoResponse {
    auction_info: AuctionInfo;
};

export interface HasBidsResponse {
    has_bids: {
        has_bids: boolean
    }
}

export interface AuctionContract {
    getAuctionInfo(): Promise<AuctionInfoResponse>;
    hasBids(viewing_key: string): Promise<HasBidsResponse>;
    changeMinimumBid(amount: string): Promise<ContractMessageResponse<void>>;
    closeAuction(): Promise<ContractMessageResponse<void>>;
};

export const auctionDef: ContractDefinition = {
    queries: {
        getAuctionInfo(): ContractQueryRequest {
            return { auction_info: { } };
        },
        hasBids( {address}: Context, viewing_key: string ): ContractQueryRequest {
            return { has_bids: { address, viewing_key } }
        }
    },
    messages: {
        changeMinimumBid(_: Context, amount: string): ContractMessageRequest {
            const handleMsg = {
                change_minimum_bid: {
                    minimum_bid: amount
                }
            }
            return { handleMsg, fees: 50000 }
        },
        closeAuction() {
            const handleMsg = {
                finalize: {}
            };
            return { handleMsg, fees: 50000 };
        }
    }
};

