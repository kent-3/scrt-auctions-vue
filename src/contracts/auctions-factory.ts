import {
    BaseContract,
    Context,
    ContractDefinition,
    ContractMessageResponse,
    ContractQueryRequest,
    createContract
}   from '@stakeordie/griptape.js';
import { formatAmountforToken, fromLiteraltoEpoch, getCodeHash } from '@/utils';
import {v4 as uuid} from 'uuid';

export interface Auction {
    address: string,
    label: string,
    pair: string,
    sell_amount: string,
    sell_decimals: number,
    minimum_bid: string,
    bid_decimals: number,
    ends_at: number
}

export interface ActiveAuctionsListInfo {
    list_active_auctions: {
        active: Auction[];
    };
}

export interface ViewingKeyResponse {
    viewing_key: {
        key: string;
    }
}

export interface AuctionFactoryContract extends BaseContract {
    listActiveAuctions(): Promise<ActiveAuctionsListInfo>;
    createViewingKey(): Promise<ContractMessageResponse<ViewingKeyResponse>>;
    createAuction(form: CreateAuctionForm): Promise<ContractMessageResponse<void>>;
}

export interface CreateAuctionForm {
    sellContract: string;
    sellAmount: string;
    bidContract: string;
    minimumBid: string;
    endsAt: string;
    description: string;
}

const auctionFactoryDef: ContractDefinition = {
    queries: {
        listActiveAuctions(): ContractQueryRequest {
            return { list_active_auctions: {} };
        }
    },
    messages: {
        createViewingKey( {entropy}: Context) {
            const handleMsg = {
                create_viewing_key: {
                    entropy
                }
            };
            return { handleMsg, fees: 50000 };
        },

        createAuction(_, form: CreateAuctionForm) {
            const label = uuid();
            const sell_amount = formatAmountforToken(form.sellContract, form.sellAmount);
            const minimum_bid = formatAmountforToken(form.bidContract, form.minimumBid);
            const sell_token_code_hash = getCodeHash(form.sellContract);
            const bid_token_code_hash = getCodeHash(form.bidContract);
            const ends_at = fromLiteraltoEpoch(form.endsAt);

            const handleMsg = {
                create_auction: {
                    label,
                    sell_contract: {
                        address: form.sellContract,
                        code_hash: sell_token_code_hash
                    },
                    bid_contract: {
                        address: form.bidContract,
                        code_hash: bid_token_code_hash
                    },
                    sell_amount,
                    minimum_bid,
                    ends_at,
                    description: form.description
                }
            };
            return { handleMsg };
        }
    }
};

export const auctionFactory = createContract<AuctionFactoryContract>({
    id:'auction-factory',
    at:'secret1vqaes7her8jf7vkmpemw85j4mf3xl590c74736',
    definition: auctionFactoryDef
});