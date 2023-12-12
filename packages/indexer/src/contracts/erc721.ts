import { ContractType } from '../types';
import CONTRACTS from './allContracts';

const ERC721_CONTRACTS = CONTRACTS.filter((contract) => contract.type === ContractType.ERC721);

export default ERC721_CONTRACTS;
