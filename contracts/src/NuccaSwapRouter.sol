// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Swap {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IPermit2AllowanceTransfer {
    function transferFrom(address from, address to, uint160 amount, address token) external;
}

interface IV3SwapRouter02 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);

    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);
}

interface IV2SwapRouter02 {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract NuccaSwapRouter {
    struct ExactInputSingleRequest {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        uint160 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
        uint64 deadline;
    }

    IPermit2AllowanceTransfer public immutable permit2;
    IV2SwapRouter02 public immutable v2Router;
    IV3SwapRouter02 public immutable swapRouter;
    address public admin;
    bool public paused;
    uint160 public maxInputAmount = type(uint160).max;

    mapping(address => bool) public allowedToken;
    mapping(bytes32 => bool) public allowedV2Pool;
    mapping(bytes32 => bool) public allowedPool;
    mapping(bytes32 => bool) public allowedPath;

    event ExactInputSingleSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOut
    );
    event ExactInputPathSwap(
        address indexed user,
        bytes32 indexed pathHash,
        uint256 amountIn,
        uint256 amountOut
    );
    event V2ExactInputSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event MixedSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed bridgeToken,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event AllowedTokenSet(address indexed token, bool allowed);
    event AllowedV2PoolSet(address indexed tokenIn, address indexed tokenOut, bool allowed);
    event AllowedPoolSet(address indexed tokenIn, address indexed tokenOut, uint24 fee, bool allowed);
    event AllowedPathSet(bytes32 indexed pathHash, bool allowed);
    event MaxInputAmountSet(uint160 amount);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event Paused(bool paused);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    modifier whenActive() {
        require(!paused, "paused");
        _;
    }

    constructor(
        IPermit2AllowanceTransfer permit2_,
        IV2SwapRouter02 v2Router_,
        IV3SwapRouter02 swapRouter_,
        address nucca,
        address wld,
        address usdc
    ) {
        require(address(permit2_) != address(0), "permit2 required");
        require(address(v2Router_) != address(0), "v2 router required");
        require(address(swapRouter_) != address(0), "router required");
        require(nucca != address(0), "nucca required");
        require(wld != address(0), "wld required");
        require(usdc != address(0), "usdc required");

        permit2 = permit2_;
        v2Router = v2Router_;
        swapRouter = swapRouter_;
        admin = msg.sender;

        allowedToken[nucca] = true;
        allowedToken[wld] = true;
        allowedToken[usdc] = true;
        emit AllowedTokenSet(nucca, true);
        emit AllowedTokenSet(wld, true);
        emit AllowedTokenSet(usdc, true);
    }

    function swapExactInputSingleWithPermit2(ExactInputSingleRequest calldata request)
        external
        whenActive
        returns (uint256 amountOut)
    {
        _validateSingle(request);
        permit2.transferFrom(msg.sender, address(this), request.amountIn, request.tokenIn);
        amountOut = _swapExactInputSingle(request);
    }

    function swapExactInputSingleWithApproval(ExactInputSingleRequest calldata request)
        external
        whenActive
        returns (uint256 amountOut)
    {
        _validateSingle(request);
        _safeTransferFrom(request.tokenIn, msg.sender, address(this), request.amountIn);
        amountOut = _swapExactInputSingle(request);
    }

    function swapExactInputWithPermit2(
        bytes calldata path,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) external whenActive returns (uint256 amountOut) {
        _validatePath(path, amountIn, deadline);
        address tokenIn = _firstToken(path);
        permit2.transferFrom(msg.sender, address(this), amountIn, tokenIn);
        amountOut = _swapExactInput(path, amountIn, amountOutMinimum);
    }

    function swapExactInputWithApproval(
        bytes calldata path,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) external whenActive returns (uint256 amountOut) {
        _validatePath(path, amountIn, deadline);
        address tokenIn = _firstToken(path);
        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        amountOut = _swapExactInput(path, amountIn, amountOutMinimum);
    }

    function swapV2ExactInputWithPermit2(
        address tokenIn,
        address tokenOut,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) external whenActive returns (uint256 amountOut) {
        _validateV2(tokenIn, tokenOut, amountIn, amountOutMinimum, deadline);
        permit2.transferFrom(msg.sender, address(this), amountIn, tokenIn);
        amountOut = _swapV2ExactInput(tokenIn, tokenOut, amountIn, amountOutMinimum, deadline, msg.sender);
    }

    function swapV2ExactInputWithApproval(
        address tokenIn,
        address tokenOut,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) external whenActive returns (uint256 amountOut) {
        _validateV2(tokenIn, tokenOut, amountIn, amountOutMinimum, deadline);
        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        amountOut = _swapV2ExactInput(tokenIn, tokenOut, amountIn, amountOutMinimum, deadline, msg.sender);
    }

    function swapV2ToV3WithPermit2(
        address tokenIn,
        address bridgeToken,
        address tokenOut,
        uint24 v3Fee,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) external whenActive returns (uint256 amountOut) {
        _validateMixed(tokenIn, bridgeToken, tokenOut, v3Fee, amountIn, amountOutMinimum, deadline, true);
        permit2.transferFrom(msg.sender, address(this), amountIn, tokenIn);
        amountOut = _swapV2ToV3(tokenIn, bridgeToken, tokenOut, v3Fee, amountIn, amountOutMinimum, deadline);
    }

    function swapV3ToV2WithPermit2(
        address tokenIn,
        address bridgeToken,
        address tokenOut,
        uint24 v3Fee,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) external whenActive returns (uint256 amountOut) {
        _validateMixed(tokenIn, bridgeToken, tokenOut, v3Fee, amountIn, amountOutMinimum, deadline, false);
        permit2.transferFrom(msg.sender, address(this), amountIn, tokenIn);
        amountOut = _swapV3ToV2(tokenIn, bridgeToken, tokenOut, v3Fee, amountIn, amountOutMinimum, deadline);
    }

    function setAllowedToken(address token, bool allowed) external onlyAdmin {
        require(token != address(0), "token required");
        allowedToken[token] = allowed;
        emit AllowedTokenSet(token, allowed);
    }

    function setAllowedPool(address tokenIn, address tokenOut, uint24 fee, bool allowed)
        external
        onlyAdmin
    {
        require(allowedToken[tokenIn] && allowedToken[tokenOut], "token not allowed");
        allowedPool[_poolKey(tokenIn, tokenOut, fee)] = allowed;
        emit AllowedPoolSet(tokenIn, tokenOut, fee, allowed);
    }

    function setAllowedV2Pool(address tokenIn, address tokenOut, bool allowed) external onlyAdmin {
        require(allowedToken[tokenIn] && allowedToken[tokenOut], "token not allowed");
        allowedV2Pool[_v2PoolKey(tokenIn, tokenOut)] = allowed;
        emit AllowedV2PoolSet(tokenIn, tokenOut, allowed);
    }

    function setAllowedPath(bytes calldata path, bool allowed) external onlyAdmin {
        require(path.length >= 43 && (path.length - 20) % 23 == 0, "bad path");
        bytes32 pathHash = keccak256(path);
        allowedPath[pathHash] = allowed;
        emit AllowedPathSet(pathHash, allowed);
    }

    function setMaxInputAmount(uint160 amount) external onlyAdmin {
        require(amount > 0, "amount required");
        maxInputAmount = amount;
        emit MaxInputAmountSet(amount);
    }

    function setPaused(bool value) external onlyAdmin {
        paused = value;
        emit Paused(value);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "admin required");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    function _validateSingle(ExactInputSingleRequest calldata request) internal view {
        require(block.timestamp <= request.deadline, "expired");
        require(request.amountIn > 0 && request.amountIn <= maxInputAmount, "bad amount");
        require(request.amountOutMinimum > 0, "min out required");
        require(allowedToken[request.tokenIn] && allowedToken[request.tokenOut], "token not allowed");
        require(allowedPool[_poolKey(request.tokenIn, request.tokenOut, request.fee)], "pool not allowed");
    }

    function _validateV2(
        address tokenIn,
        address tokenOut,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) internal view {
        require(block.timestamp <= deadline, "expired");
        require(amountIn > 0 && amountIn <= maxInputAmount, "bad amount");
        require(amountOutMinimum > 0, "min out required");
        require(allowedToken[tokenIn] && allowedToken[tokenOut], "token not allowed");
        require(allowedV2Pool[_v2PoolKey(tokenIn, tokenOut)], "v2 pool not allowed");
    }

    function _validateMixed(
        address tokenIn,
        address bridgeToken,
        address tokenOut,
        uint24 v3Fee,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline,
        bool v2First
    ) internal view {
        require(block.timestamp <= deadline, "expired");
        require(amountIn > 0 && amountIn <= maxInputAmount, "bad amount");
        require(amountOutMinimum > 0, "min out required");
        require(
            allowedToken[tokenIn] && allowedToken[bridgeToken] && allowedToken[tokenOut],
            "token not allowed"
        );
        if (v2First) {
            require(allowedV2Pool[_v2PoolKey(tokenIn, bridgeToken)], "v2 pool not allowed");
            require(allowedPool[_poolKey(bridgeToken, tokenOut, v3Fee)], "v3 pool not allowed");
        } else {
            require(allowedPool[_poolKey(tokenIn, bridgeToken, v3Fee)], "v3 pool not allowed");
            require(allowedV2Pool[_v2PoolKey(bridgeToken, tokenOut)], "v2 pool not allowed");
        }
    }

    function _validatePath(bytes calldata path, uint160 amountIn, uint64 deadline) internal view {
        require(block.timestamp <= deadline, "expired");
        require(amountIn > 0 && amountIn <= maxInputAmount, "bad amount");
        require(allowedPath[keccak256(path)], "path not allowed");
    }

    function _swapExactInputSingle(ExactInputSingleRequest calldata request)
        internal
        returns (uint256 amountOut)
    {
        _safeApprove(request.tokenIn, address(swapRouter), request.amountIn);
        amountOut = swapRouter.exactInputSingle(
            IV3SwapRouter02.ExactInputSingleParams({
                tokenIn: request.tokenIn,
                tokenOut: request.tokenOut,
                fee: request.fee,
                recipient: msg.sender,
                amountIn: request.amountIn,
                amountOutMinimum: request.amountOutMinimum,
                sqrtPriceLimitX96: request.sqrtPriceLimitX96
            })
        );
        _safeApprove(request.tokenIn, address(swapRouter), 0);

        emit ExactInputSingleSwap(
            msg.sender, request.tokenIn, request.tokenOut, request.fee, request.amountIn, amountOut
        );
    }

    function _swapExactInput(bytes calldata path, uint160 amountIn, uint256 amountOutMinimum)
        internal
        returns (uint256 amountOut)
    {
        require(amountOutMinimum > 0, "min out required");
        address tokenIn = _firstToken(path);
        _safeApprove(tokenIn, address(swapRouter), amountIn);
        amountOut = swapRouter.exactInput(
            IV3SwapRouter02.ExactInputParams({
                path: path,
                recipient: msg.sender,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum
            })
        );
        _safeApprove(tokenIn, address(swapRouter), 0);

        emit ExactInputPathSwap(msg.sender, keccak256(path), amountIn, amountOut);
    }

    function _swapV2ExactInput(
        address tokenIn,
        address tokenOut,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline,
        address recipient
    ) internal returns (uint256 amountOut) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        _safeApprove(tokenIn, address(v2Router), amountIn);
        uint256[] memory amounts =
            v2Router.swapExactTokensForTokens(amountIn, amountOutMinimum, path, recipient, deadline);
        _safeApprove(tokenIn, address(v2Router), 0);

        amountOut = amounts[amounts.length - 1];
        emit V2ExactInputSwap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function _swapV2ToV3(
        address tokenIn,
        address bridgeToken,
        address tokenOut,
        uint24 v3Fee,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) internal returns (uint256 amountOut) {
        uint256 bridgeBefore = _balanceOf(bridgeToken, address(this));
        _swapV2ExactInput(tokenIn, bridgeToken, amountIn, 1, deadline, address(this));
        uint256 bridgeAmount = _balanceOf(bridgeToken, address(this)) - bridgeBefore;
        require(bridgeAmount > 0, "no bridge output");

        _safeApprove(bridgeToken, address(swapRouter), bridgeAmount);
        amountOut = swapRouter.exactInputSingle(
            IV3SwapRouter02.ExactInputSingleParams({
                tokenIn: bridgeToken,
                tokenOut: tokenOut,
                fee: v3Fee,
                recipient: msg.sender,
                amountIn: bridgeAmount,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        );
        _safeApprove(bridgeToken, address(swapRouter), 0);

        emit MixedSwap(msg.sender, tokenIn, bridgeToken, tokenOut, amountIn, amountOut);
    }

    function _swapV3ToV2(
        address tokenIn,
        address bridgeToken,
        address tokenOut,
        uint24 v3Fee,
        uint160 amountIn,
        uint256 amountOutMinimum,
        uint64 deadline
    ) internal returns (uint256 amountOut) {
        uint256 bridgeBefore = _balanceOf(bridgeToken, address(this));
        _safeApprove(tokenIn, address(swapRouter), amountIn);
        swapRouter.exactInputSingle(
            IV3SwapRouter02.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: bridgeToken,
                fee: v3Fee,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 1,
                sqrtPriceLimitX96: 0
            })
        );
        _safeApprove(tokenIn, address(swapRouter), 0);

        uint256 bridgeAmount = _balanceOf(bridgeToken, address(this)) - bridgeBefore;
        require(bridgeAmount > 0, "no bridge output");
        amountOut = _swapV2ExactInput(
            bridgeToken, tokenOut, uint160(bridgeAmount), amountOutMinimum, deadline, msg.sender
        );

        emit MixedSwap(msg.sender, tokenIn, bridgeToken, tokenOut, amountIn, amountOut);
    }

    function _poolKey(address tokenIn, address tokenOut, uint24 fee) internal pure returns (bytes32) {
        return keccak256(abi.encode(tokenIn, tokenOut, fee));
    }

    function _v2PoolKey(address tokenIn, address tokenOut) internal pure returns (bytes32) {
        return keccak256(abi.encode(tokenIn, tokenOut));
    }

    function _firstToken(bytes calldata path) internal pure returns (address token) {
        require(path.length >= 43, "bad path");
        assembly {
            token := shr(96, calldataload(path.offset))
        }
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeCall(IERC20Swap.transferFrom, (from, to, amount)));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "transferFrom failed");
    }

    function _safeApprove(address token, address spender, uint256 amount) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeCall(IERC20Swap.approve, (spender, amount)));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "approve failed");
    }

    function _balanceOf(address token, address account) internal view returns (uint256 balance) {
        (bool success, bytes memory data) =
            token.staticcall(abi.encodeWithSignature("balanceOf(address)", account));
        require(success && data.length >= 32, "balance failed");
        balance = abi.decode(data, (uint256));
    }
}
